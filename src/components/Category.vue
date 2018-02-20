<template>
<div class="category-group">
<draggable :options="{draggable:'.draggable',group:'stuff',clone: false}" element="ul" :class="['categories','category-' + catId]" :data-category="catId"  @start="startDrag" @end="endDrag">
  <li v-for="(category,catIndex) in lists" :class="['category','draggable','depth-' + category.depth,'category-' + category.id]" :data-id="category.id" :data-weight="category.weight" :data-parent="category.parent_id">
  	<h3><input v-model="lists[catIndex].name" type="text" minlength="1" class="category-name" /><input value="edit" type="submit" @click.prevent.stop="editCategory(category)" class="edit" /></h3>
  	<category v-bind:lists="category.children" :depth="depth+1" :catId="category.id" :catName="category.name" :numItems="category.items.length" :numSubs="category.children.length"></category>
  	<ol v-if="category.items.length > 0">
  		<li v-for="(item,itemIndex) in category.items" class="item draggable">
  			<h4>{{item.name}}</h4>
  			<p v-if="mayDeleteItem(item)" class="delete-item" v-on:click.prevent.stop="deleteItem(item)" title="delete-item">-</p>
  		</li>
  	</ol>
  </li>
</draggable>
	<div class="category-control add-category" @click="showAdd('category')" :class="{'selected': addMode == 'category'}" title="Add category">+</div>
	<div v-if="mayAddItem()" class="category-control add-item" @click="showAdd('item')" :class="{'selected': addMode == 'item'}" title="Add item">+</div>
	<div v-if="mayDeleteCategory()" class="category-control delete-category" @click="deleteCategory()" title="Delete category">-</div>
	<form v-if="addMode != 'none'" class="add-form" v-on:submit.prevent="addCategory">
		<label>{{addLabel}}</label>
		<input type="text" minlength="2" size="20" v-model="newName" />
		<input type="submit" value="Add" />
	</form>
</div>
</template>

<script>
import axios from 'axios';
import Category from './Category.vue';
import draggable from 'vuedraggable';

export default {
	name: "category",
	props: [
		'lists',
		'depth',
		'catId',
		'catName',
		'numSubs',
		'numItems'
	],
	data() {
		return {
			addMode: 'none',
			newName: "",
			roleId: 0,
			userId: 0
		}
	},
	created() {
		let user = this.$ls.get('user');
		if (user && user.roleId) {
			this.roleId = user.roleId;
			this.userId = user.id;
		}
	},
	computed: {
		addLabel() {
			switch (this.addMode) {
				case 'category':
					return `Add a new category to ${this.catName}`;
				case 'item':
					return `Add a new item to ${this.catName}`
				default:
					return "";
			}
		}
	},
	components: {
		Category,
		draggable
	},
	methods: {
		startDrag(data) {
			let cls = data.item.getAttribute('class');
			data.item.setAttribute('class', cls + ' dragging')
		},
		endDrag(data) {
			let cls = data.item.getAttribute('class');
			data.item.setAttribute('class', cls.replace(/\s+dragging/,''));
			let update = {
				parent: data.item.parentNode.getAttribute('data-category'),
				id: data.item.getAttribute('data-id'),
				index: data.newIndex,
				oldIndex: data.oldIndex
			}
			axios.put('api/category/move',update).then(response => {
				comp.triggerRefresh(response);
			}).catch(error => console.log(error));
		},
		showAdd(mode) {

			switch (this.addMode) {
				case 'none':
					switch (mode) {
						case 'item':
						case 'category':
							this.addMode = mode;
							break;
					}
					break;
				default:
					if (this.addMode == mode) {
						this.addMode = 'none';	
					} else {
						this.addMode = mode;
					}
					break;
			}
		},
		addCategory() {
			if (this.newName.length > 0 && this.addMode != 'none') {
				this.newName = this.newName.trim();
				let user = this.$ls.get('user'), userId = 0;
				if (user) {
					userId = user.id;
				}
				let params = {
					name: this.newName,
					parent: this.catId,
					userId: userId
				};
				let comp = this;
				axios.post(`/api/${this.addMode}/create`,params)
					.then(response => {
						comp.triggerRefresh(response);
					})
					.catch(error => console.log(error));
				
				this.addMode = "none";
				this.newName = "";
			}
			
		},
		triggerRefresh(response) {
			if (response.data && response.data.stuff) {
				if (response.data.stuff instanceof Array) {
					let data = response.data;
					data.userId = this.userId;
					this.$bus.$emit('stuff-update',data);
				}
			}
		},
		mayDeleteItem(item) {
			return this.addMode == "none" && this.roleId == 1 || item.user_id == this.userId;
		},
		mayAddItem() {
			return this.numSubs <1 && this.catId > 0 && this.roleId <= 2;
		},
		mayDeleteCategory() {
			return this.numSubs < 1 && this.catId > 0 && this.roleId <= 2;
		},
		editCategory(category) {
			let comp = this;
			axios.put(`/api/category/edit/${category.id}`,{
				name: category.name
			}).then(response => {
				comp.triggerRefresh(response);
			})
			.catch(error => console.log(error))
		},
		deleteCategory() {
			let comp = this;
			if (this.catId > 0 && this.numItems < 1) {
				axios.delete(`/api/category/delete/${this.catId}`)
					.then(response => {
						comp.triggerRefresh(response);
					})
					.catch(error => console.log(error))
			}
		},
		deleteItem(item) {
			let user = this.$ls.get('user');
			if (user) {
				if (user.id > 0 && (
						item.user_id == user.id || user.roleId === 1
					)) {
					let comp = this;
					axios.delete(`/api/item/delete/${item.id}`)
					.then(response => {
						comp.triggerRefresh(response);
					})
					.catch(error => console.log(error));
				}
			}
		}
	}
}

</script>